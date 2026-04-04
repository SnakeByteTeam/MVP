#!/usr/bin/env bash
set -euo pipefail

DB_CONTAINER="${DB_CONTAINER:-postgres-timescale}"
DB_USER="${DB_USER:-admin}"
DB_NAME="${DB_NAME:-view4life}"
API_URL="${API_URL:-http://localhost:3000}"
PLANT_ID="${PLANT_ID:-8F988634-6DEF-4916-AF45-E017156AC153}"
RULE_ID="${RULE_ID:-ALM_LIGHT_ON_NERI}"
RULE_NAME="${RULE_NAME:-Allarme accensione luce Appartamento Neri}"

if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
  echo "[ERROR] Container DB '$DB_CONTAINER' non trovato o non attivo"
  exit 1
fi

echo "[INFO] Cerco una luce nel plant $PLANT_ID..."
DEVICE_ID="$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c "
  SELECT dev->>'id'
  FROM plant p
  JOIN LATERAL jsonb_array_elements(COALESCE(p.data->'rooms','[]'::jsonb)) room ON TRUE
  JOIN LATERAL jsonb_array_elements(COALESCE(room->'devices','[]'::jsonb)) dev ON TRUE
  WHERE p.id = '${PLANT_ID}'
    AND (
      lower(COALESCE(dev->>'type','')) LIKE '%light%'
      OR lower(COALESCE(dev->>'subType','')) LIKE '%light%'
    )
  ORDER BY dev->>'id'
  LIMIT 1;
")"

DEVICE_ID="$(echo "$DEVICE_ID" | tr -d '[:space:]')"

if [[ -z "$DEVICE_ID" ]]; then
  echo "[ERROR] Nessuna luce trovata nel plant $PLANT_ID"
  exit 1
fi

WARD_ID="$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A -c "
  SELECT COALESCE(ward_id, 1)
  FROM plant
  WHERE id = '${PLANT_ID}'
  LIMIT 1;
")"
WARD_ID="$(echo "$WARD_ID" | tr -d '[:space:]')"

if [[ -z "$WARD_ID" ]]; then
  echo "[ERROR] Plant $PLANT_ID non trovato"
  exit 1
fi

echo "[INFO] Device luce: $DEVICE_ID"
echo "[INFO] Ward: $WARD_ID"
echo "[INFO] Upsert regola allarme per evento 'on'..."

docker exec -i "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" <<SQL
UPDATE plant
SET ward_id = COALESCE(ward_id, ${WARD_ID})
WHERE id = '${PLANT_ID}';

INSERT INTO alarm_rule (
  id,
  name,
  device_id,
  priority,
  threshold_operator,
  threshold_value,
  arming_time,
  dearming_time,
  is_armed
) VALUES (
  '${RULE_ID}',
  '${RULE_NAME}',
  '${DEVICE_ID}',
  1,
  '=',
  'on',
  '00:00:00',
  '23:59:59',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  device_id = EXCLUDED.device_id,
  priority = EXCLUDED.priority,
  threshold_operator = EXCLUDED.threshold_operator,
  threshold_value = EXCLUDED.threshold_value,
  arming_time = EXCLUDED.arming_time,
  dearming_time = EXCLUDED.dearming_time,
  is_armed = EXCLUDED.is_armed,
  updated_at = NOW();
SQL

TS="$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"

echo
echo "[INFO] Ultimi alarm_event della regola ${RULE_ID}:"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT id, alarm_rule_id, activation_time, resolution_time
  FROM alarm_event
  WHERE alarm_rule_id = '${RULE_ID}'
  ORDER BY activation_time DESC
  LIMIT 5;
"

echo
echo "[INFO] Log utili backend:"
echo "docker logs --tail 80 mvp-server-1 | grep -E 'NOTIFICATION CONTROLLER|allarme|alarm'"

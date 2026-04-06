import { Inject } from "@nestjs/common";
import { Pool } from "pg";
import { PG_POOL } from "src/database/database.module";
import { WriteNotificationRepoPort } from "src/notifications/application/repository/write-notification.repository";

export class NotificationRepositoryImpl implements WriteNotificationRepoPort {

    constructor(
        @Inject(PG_POOL)
        private readonly pool: Pool
    ) {}

    async writeNotification(ward_id: number, alarm_id: string, timestamp: string): Promise<boolean> {
        const result = await this.pool.query(
                `INSERT INTO notification (ward_id, alarm_event_id, timestamp)
                    SELECT $1, ae.id, $3::timestamptz
                    FROM alarm_event ae
                    WHERE ae.alarm_rule_id = $2
                        AND ae.activation_time <= $3::timestamptz
                    ORDER BY ae.activation_time DESC
                    LIMIT 1
                    RETURNING id`,
                [ward_id, alarm_id, timestamp],
        );

        return (result.rowCount ?? 0) > 0;
    }
}
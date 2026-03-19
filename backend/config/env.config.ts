export default () => ({
  clientId: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  host2: process.env.HOST2,
  redirectUrl: 'http://localhost:3000/tokens/callback'
});
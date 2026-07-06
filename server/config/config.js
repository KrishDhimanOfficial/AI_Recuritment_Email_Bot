import dotenv from "dotenv";
dotenv.config({ quiet: true, path: ".env" });

export default {
  isDev: process.env.NODE_ENV === "dev",
  isProd: process.env.NODE_ENV === "prod",
  node_env: String(process.env.NODE_ENV),
  port: Number(process.env.PORT),
  client_origin: String(process.env.CLIENT_ORIGIN),

  // ------- DATABASE ------------
  db_name: String(process.env.DB_NAME),
  db_username: String(process.env.DB_USERNAME),
  db_password: String(process.env.DB_PASSWORD),
  db_host: String(process.env.DB_HOST),
  db_port: Number(process.env.DB_PORT),

  //------- Google Config ---------
  google_client_id: String(process.env.GOOGLE_CLIENT_ID),
  google_client_sceret: String(process.env.GOOGLE_CLIENT_SECRET),
  gemini_api_key: String(process.env.GEMINI_API_KEY),

  //------- SMTP -----------
  smtp_host: String(process.env.SMTP_HOST),
  smtp_port: Number(process.env.SMTP_PORT),
  smtp_email: String(process.env.SMTP_EMAIL),
  smtp_password: String(process.env.SMTP_PASSWORD),
};

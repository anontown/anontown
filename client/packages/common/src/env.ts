export interface Env {
  client: {
    origin: string;
  };
  camo: {
    origin: string;
    key: string;
  };
  api: {
    origin: string;
  };
  socket: {
    origin: string;
  };
  recaptcha: {
    siteKey: string;
  };
  imgur: {
    clientID: string;
  };
  ga: {
    id: string;
  } | null;
}

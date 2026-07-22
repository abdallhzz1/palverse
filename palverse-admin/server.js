const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3001", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, hostname, (error) => {
      if (error) {
        throw error;
      }

      console.log(`Palverse admin ready on ${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Palverse admin:", error);
    process.exit(1);
  });

const bcrypt = require("bcryptjs");

const hash = "$2b$10$2UxhB1ctqCEjgdwEVCvQ2eHO.OEmZ36Au/18k9NjUf2F5ty2Pdi8K";

bcrypt.compare("admin123", hash).then(res => {
  console.log("Password match:", res);
});

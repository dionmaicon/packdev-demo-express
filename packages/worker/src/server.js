const { createApp } = require("./app");

const port = process.env.PORT || 3001;
createApp().listen(port, () => {
  console.log(`listening on ${port}`);
});

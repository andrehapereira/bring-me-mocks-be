(function(window) {
    window["bmm"] = window["bmm"] || {
        config: {}
    };
  
    // Environment variables
    window["bmm"]["config"]["apiDomain"] = "${API_DOMAIN}";
    window["bmm"]["config"]["apiProtocol"] = "${API_PROTOCOL}";
    window["bmm"]["config"]["apiPort"] = "${API_PORT}";
    window["bmm"]["config"]["appTitle"] = "${APP_TITLE}";
  })(this);
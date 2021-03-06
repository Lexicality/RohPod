// Generated by CoffeeScript 1.6.3
(function() {
  if (window.MicroEvent == null) {
    throw new Error("Where's the microevent library?!");
  }

  window.RohBot = (function() {
    var legacy,
      _this = this;

    function RohBot(url) {
      var connected, manualSysMessage,
        _this = this;
      this.url = url;
      this.name = null;
      manualSysMessage = function(message) {
        return _this.trigger("sysmessage", {
          Date: Date.now() / 1000,
          Content: message
        });
      };
      manualSysMessage("Connecting to RohBot...");
      this.connect(url);
      connected = false;
      this.on("connected", function() {
        if (!connected) {
          manualSysMessage("Connected to RohBot!");
        }
        return connected = true;
      });
      this.on("disconnected", function() {
        if (connected) {
          manualSysMessage("Lost connection to RohBot. Reconnecting...");
        }
        connected = false;
        return _this.disconnect();
      });
      window.setInterval(function() {
        if (_this.isConnected()) {
          return _this._send("ping", {});
        } else {
          return _this.connect();
        }
      }, 2500);
    }

    RohBot.prototype.connect = function() {
      var _this = this;
      this.disconnect();
      this.socket = new WebSocket(this.url);
      this.socket.addEventListener('open', function() {
        if (_this.isConnected()) {
          return _this.trigger("connected");
        }
      });
      this.socket.addEventListener('close', function(e) {
        console.info("socket closed", e);
        return _this.trigger("disconnected");
      });
      this.socket.addEventListener('error', function(e) {
        console.error("websocket error", e);
        return _this.trigger("disconnected");
      });
      return this.socket.addEventListener('message', function(event) {
        return _this._onMessage(JSON.parse(event.data));
      });
    };

    RohBot.prototype.disconnect = function() {
      if (this.socket != null) {
        this.socket.close();
      }
      return this.socket = null;
    };

    RohBot.prototype.isConnected = function() {
      var _ref;
      return ((_ref = this.socket) != null ? _ref.readyState : void 0) === WebSocket.OPEN;
    };

    RohBot.prototype.login = function(Username, Password, Tokens, Room) {
      return this._send("auth", {
        Method: "login",
        Username: Username,
        Password: Password,
        Tokens: Tokens,
        Room: Room
      });
    };

    RohBot.prototype.register = function(Username, Password) {
      return this._send("auth", {
        Method: "register",
        Username: Username,
        Password: Password
      });
    };

    RohBot.prototype.requestHistory = function(AfterDate) {
      return this._send("chatHistoryRequest", {
        AfterDate: AfterDate
      });
    };

    RohBot.prototype.sendMessage = function(Content) {
      return this._send("sendMessage", {
        Content: Content
      });
    };

    RohBot.prototype._send = function(type, data) {
      var e;
      if (!this.isConnected()) {
        console.error("Tried to send a", type, "message with payload", data, "without being connected!");
        return;
      }
      data['Type'] = type;
      try {
        return this.socket.send(JSON.stringify(data));
      } catch (_error) {
        e = _error;
        return console.error("Unable to send", type, "message (with payload", data, ") because: ", e.message);
      }
    };

    RohBot.prototype._onMessage = function(data) {
      switch (data.Type) {
        case "authResponse":
          this.name = data.name;
          return this.trigger("login", data);
        case "chatHistory":
          return this.trigger("chathistory", data);
        case "message":
          return this.trigger("message", data.Line);
        case "sysMessage":
          return this.trigger("sysmessage", data);
        case "userList":
          return this.trigger("userlist", data.Users);
      }
    };

    MicroEvent.mixin(RohBot);

    legacy = function(name) {
      return Object.defineProperty(RohBot.prototype, 'on' + name, {
        set: function(func) {
          return this.on(name.toLowerCase(), func, false);
        }
      });
    };

    legacy("Connected");

    legacy("Disconnected");

    legacy("Login");

    legacy("ChatHistory");

    legacy("SysMessage");

    legacy("Message");

    legacy("UserList");

    return RohBot;

  }).call(this);

}).call(this);

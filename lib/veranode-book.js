'use strict';
const kad = require('kad');

/**
 * Extends {@link AbstractNode} with some built in stuff for the Vera Network
 * @class
 * @extends {AbstractNode}
 */
class VeraNode extends kad.KademliaNode {

  /**
   * Contructs the primary interface for a kad node
   * @constructor
   * @param {object} options
   * @param {object} options.transport - {@tutorial transport-adapters}
   * @param {buffer} options.identity - {@tutorial identities}
   * @param {object} options.contact - {@tutorial identities}
   * @param {object} options.storage - {@tutorial storage-adapters}
   * @param {object} options.logger - {@tutorial logging}
   * @param {object} [options.messenger] - {@tutorial messengers}
   */

  constructor(options) {
    options.node.transport = new kad.HTTPTransport();

    super(options.node);
    this.seed = options.seed;
    this.port = options.port;
    this.servicesPrefered = options.services;
    this.services = {};
    this._start();
  }

  /**
   *  Configures the nodes to listen for certain messages if they passed in
   * the specific services they want to run, checks to make sure they can run
   * the specified service
   * @private
   */
  _setServices() {
    //need to run through the possible configurations and then specify
  }


  /**
   * Starts he node listening on the specified port + joins the network
   * @private
   */
  _start(){
    //this.listen(this.port);
    this._listen(this.port);
    this.join(this.seed, function(){
      console.log(`Connected to ${this.router.size} peers!`);
    });
  }

  /**
   * Adds the specified custom messages to the node before listening
   * @private
   */
  _addServices(node, messages){
    for(let message in messages){
      this.use(message, messages[message]);
    }
  }

  _listen(){
    let handlers = new kad.KademliaRules(this);

    this.use('PING', handlers.ping.bind(handlers));
    this.use('FIND_NODE', handlers.findNode.bind(handlers));

    setInterval(() => this.refresh(0), kad.constants.T_REFRESH);
    setInterval(() => this.replicate(() => this.expire()),
                kad.constants.T_REPLICATE);

    let abshandlers = new kad.ErrorRules(this);

    this.use(abshandlers.methodNotFound.bind(abshandlers));
    this.use(abshandlers.internalError.bind(abshandlers));

    this.transport.listen(...arguments);
  }

  /**
   * Sends a job out to the network. Right now kinda simplistec but will become
   * more advanced with job complexity and extensions
   * @public
   */
  sendJob(message, params, callback){
    this.node.send(message, params, callback);
  }
}

module.exports = VeraNode;

import { EventEmitter } from 'events';

class ReputationEmitter extends EventEmitter {}

export const reputationEmitter = new ReputationEmitter();
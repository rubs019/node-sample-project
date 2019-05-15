#!/usr/bin/env node
import { Cluster } from 'cluster'

/**
 * Module dependencies.
 */

const app = require('./app/app')
const debug = require('debug')('sampleproject:server.js')
const http = require('http')
const cluster = require('cluster')
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

/**
 * Create HTTP server.js.
 */

const server = http.createServer(app)

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string): number | boolean | string {
    const port = parseInt(val, 10)

    if (isNaN(port)) {
        // named pipe
        return val
    }

    if (port >= 0) {
        // port number
        return port
    }

    return false
}

/**
 * Event listener for HTTP server.js "error" event.
 */

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges')
        process.exit(1)
        break
    case 'EADDRINUSE':
        console.error(bind + ' is already in use')
        process.exit(1)
        break
    default:
        throw error
    }
}


/**
 * Setup number of worker processes to share port which will be defined while setting up server.js
 */
let workers: Cluster[] = []
const setupWorkerProcesses = (): void => {
    // to read number of cores on system
    let numCores = require('os').cpus().length
    console.log('Master cluster setting up ' + numCores + ' workers')

    // iterate on number of cores need to be utilized by an application
    // current example will utilize all of them
    for (let i = 0; i < numCores; i++) {
        // creating workers and pushing reference in an array
        // these references can be used to receive messages from workers
        workers.push(cluster.fork())

        // to receive messages from worker process
        workers[i].on('message', function(message: string): void {
            console.log(message)
        })
    }

    // process is clustered on a core and process id is assigned
    cluster.on('online', function(worker: any): void {
        console.log('Worker ' + worker.process.pid + ' is listening')
    })

    // if any of the worker process dies then start a new one by simply forking another one
    cluster.on('exit', function(worker: any, code: any, signal: any): any {
        console.log(
            'Worker ' +
						worker.process.pid +
						' died with code: ' +
						code +
						', and signal: ' +
						signal
        )
        console.log('Starting a new worker')
        cluster.fork()
        workers.push(cluster.fork())
        // to receive messages from worker process
        workers[workers.length - 1].on('message', function(message: string): any {
            console.log(message)
        })
    })
}

/**
 * Setup server.js either with clustering or without it
 * @param isClusterRequired
 * @constructor
 */
const setupServer = (isClusterRequired: boolean): void => {

    // if it is a master process then call setting up worker process
    if (isClusterRequired && cluster.isMaster) {
        setupWorkerProcesses()
    } else {
        // to setup server.js configurations and share port address for incoming requests
        setupApp()
    }
}

function setupApp() {

    /**
		 * Listen on provided port, on all network interfaces.
		 */

    server.listen(port)
    server.on('error', onError)
    server.on('listening', onListening)
}

setupServer(false)

/**
 * Event listener for HTTP server.js "listening" event.
 */

function onListening() {
    const addr = server.address()
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port
    debug('Listening on ' + bind)
}

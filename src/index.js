/**
 * commands:
 *  setup
 *      在当前目录下获取
 *  config(c)
 *  run(r)
 *  stop(s)
 */

require( 'babel-polyfill' )
require( './log' )
require( './profile' )

let Commander          = require( 'commander' ),
    Exec               = require( 'child_process' ).exec,
    Tail               = require( 'tail' ).Tail,
    ConfigCLI          = require( './cli/config' ),
    SetupCLI           = require( './cli/setup' ),
    WorkSpaceCLI       = require( './cli/workspace' ),
    WorkSpace          = require( './core/workspace' ),
    Util               = require( './util' ),
    pkg                = require( '../package.json' ),
    logValues          = { 's' : 1, 'js' : 1 },

    findValidWorkspace = async dir => {
        let isValid = await WorkSpace.isValidWorkSpace( dir )

        if ( !isValid ) {
            dir     = WorkSpace.current()
            isValid = await WorkSpace.isValidWorkSpace( dir )
        }

        if ( isValid ) {
            return { isValid, dir }
        } else {
            log( '无法找到可运行的工作空间', 'error' )
            throw new Error
        }
    }

Commander
    .version( pkg.version, '-v, --version' )

Commander
    .command( 'setup [dir] [url]' )
    .action( ( dir, url ) => new SetupCLI( dir || '', url || '' ) )

Commander
    .command( 'config [dir]' )
    .alias( 'c' )
    .action( ( dir = process.cwd() ) => new ConfigCLI( dir ) )

Commander
    .command( 'run' )
    .alias( 'r' )
    .action( async() => {
        let result = await findValidWorkspace( process.cwd() )
        new WorkSpace( result.dir ).start()
    } )

Commander
    .command( 'stop [isAll]' )
    .alias( 's' )
    .action( async( isAll = false ) => {
        let result = await findValidWorkspace( process.cwd() )
        new WorkSpace( result.dir ).stop( isAll )
    } )

Commander
    .command( 'sa' )
    .action( async() => {
        let result = await findValidWorkspace( process.cwd() )
        new WorkSpace( result.dir ).stop( 'all' )
    } )

Commander
    .command( 'log [type]' )
    .alias( 'l' )
    .action( ( type = 's' ) => {
        if ( type in logValues ) {
            let date = Util.getFormatDate(),
                tail = new Tail( `/tmp/log/nest-${type}erver/${date}.log` )

            tail
                .on( 'line', data => log( data ) )
                .on( 'error', () => tail.unwatch() )
        } else {
            log( 'log 只接受 s/js 两个参数', 'error' )
        }
    } )

Commander
    .command( 'lo' )
    .action( () => {
        let date = Moment().format( 'YYYY/MM/' )

        Exec( `open -a finder "/tmp/log/nest-server/${date}"` )
    } )

Commander
    .command( 'ls' )
    .action( () => WorkSpaceCLI.list() )

Commander.parse( process.argv )

const express = require("express")
const app = express()
const port = process.env.port || 3000

const fetch = require("node-fetch")
const fs = require("fs")
const bodyParser = require ("body-parser")

const Users = require("./json/users.json")
const Pcs = require("./json/pcs.json")
const Sites = require("./json/sites.json")
const BitcoinWallets = require("./json/BitcoinWallets.json")
const Virus = require("./json/virus.json")

// FUNCTIONS //

//
function _Account ( login, pass ) {
    if ( !login ) return new Error("Login is required")
    if ( !pass ) return new Error("Password is required")

    let UserForRetun = Users.find( _user => _user.login === login && _user.password === pass )
    if ( !UserForRetun ) return new Error(`Account Not Found [ Login: ${ login } | Password: ${ pass } ]`)
    return UserForRetun
}
//
function _PC ( id ) {
    if ( !id ) return new Error("ID is required")

    let PcForReturn = Pcs.find ( _pc => _pc.id === id )
    if ( !PcForReturn ) return new Error(`Pc Not Found [ ID: ${ id } ]`)
    return PcForReturn
}
//
function _BitcoinWallet ( id ) {
    if ( !id ) return new Error("ID is required")

    let WalletForReturn = BitcoinWallets.find ( btc => btc.id === id )
    if ( !WalletForReturn ) return new Error(`Wallet Not Found [ ID: ${ id } ]`)
    return WalletForReturn
}
//

//
function _GenereteRandomString ( length ) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
//
function _SaveJsons ( ) {
    fs.writeFile("src/json/users.json", JSON.stringify( Users ), ( err ) => {
        if ( err ) return console.log ( err )
        fs.writeFile("src/json/pcs.json", JSON.stringify( Pcs ), ( err ) => {
            if ( err ) return console.log ( err )
            fs.writeFile("src/json/BitcoinWallets.json", JSON.stringify( BitcoinWallets ), ( err ) => {
                if ( err ) return console.log ( err )
                fs.writeFile("src/json/sites.json", JSON.stringify( Sites ), ( err ) => {
                    if ( err ) return console.log ( err )
                    fs.writeFile("src/json/virus.json", JSON.stringify( Virus ), ( err ) => {
                    })
                })
            })
        })
    })
}
// USES //

app.use ( express.static ( __dirname ) )
app.use ( express.urlencoded ( { extended: false } ) )
app.use ( express.json() )
// SETS //

app.set ( "view engine", "ejs" )
app.set ( "views", __dirname +"\\" )

// GETS //

app.get ("/", ( req, res ) => {
    res.render("game/GameRegister/register", { err: null })
})

app.get ( "/login", ( req, res ) => {
    res.render("game/GameLogin/login", { err: null })
})

app.get ( "/register", ( req, res ) => {
    res.render("game/GameRegister/register", { err: null })
})

// API //
    // RELOAD PAGE //
        app.get ( "/api/reload/:userID", ( req, res ) => {
            let User = req.params.userID

            if ( !User ) return
            User = Users.find ( _user => _user.id === User )
            if ( User.status === 0 ) return res.send({ reload: true })
            return res.send({ reload: false })
        })

    // INFECT USER //
        app.get ( "/api/virus/:virusID/:userID", ( req, res ) => {
            let User = req.params.userID
            let VirusID = req.params.virusID

            if ( !User || !VirusID ) return
            User = Users.find ( _user => _user.id === User )
            VirusID = Virus.find ( _virus => _virus.id === VirusID )

            if ( !User || !VirusID ) return

            console.log( _PC(User.id))
            
            let PC = _PC(User.id)

            PC.apps.map ( a => {a.name = "Programa Morto", open=null; a.iconName = "dead-icon.png"} )
            User.status = 0
            _SaveJsons()

            console.log(VirusID.VirusCreate.code)
            res.send( { status: "ok" } )
        })

    // GET SITE //
        app.post ( "/api/site", ( req, res ) => {
            let siteid = req.body.id

            let Site = Sites.filter ( _site => _site.id === siteid )[0]
            res.send( { site: Site })
        })

    // SEARCH //
        app.post( "/api/search", ( req, res ) => {
            let querySearch = req.body.query
            
            let sites = Sites.filter ( _site => _site.SiteCreate.name.includes( querySearch ) )
            res.send({ sites: sites, query: querySearch })
        })

    // EDITUSER //
        app.post( "/api/edituser", ( req, res ) => {
            let UserInfos =  req.body.UserInfos
            let BtcInfos=  req.body.BtcInfos
            let PcInfos =  req.body.PcInfos
            let VirusCreate = req.body.VirusCreate
            let SiteCreate = req.body.SiteCreate

            if ( !UserInfos || !BtcInfos || !PcInfos ) return
            UserInfos.sites = UserInfos.sites.split(" ")
            UserInfos.virus = UserInfos.virus.split(" ")

            let User = _Account ( UserInfos.login, UserInfos.password )
            if ( !User ) return
            let btc = _BitcoinWallet ( User.id )
            let pc = _PC ( User.id )

            pc = PcInfos
            btc = BtcInfos
            User = UserInfos

            if ( VirusCreate ) {
                let VirusID = _GenereteRandomString(8)
                UserInfos.virus[0] = { name: VirusCreate.name, id: VirusID }
                Virus.push({ VirusCreate, id: VirusID })
                _Account ( UserInfos.login, UserInfos.password ).virus = UserInfos.virus
            }
            if ( SiteCreate ) {
                let SiteID = _GenereteRandomString(8)
                UserInfos.sites[0] = { name: SiteCreate.name, id: SiteID }
                Sites.push({ SiteCreate, id: SiteID })
                _Account ( UserInfos.login, UserInfos.password ).sites = UserInfos.sites
            }

            _SaveJsons()
        })

    // LOGIN //
        app.post ( "/login", ( req, res ) => {
            let UserInfos = { login: req.body.login, password: req.body.password }

            let User = Users.find ( _user => _user.login === UserInfos.login && _user.password === UserInfos.password)
            if ( !User ) return res.render("game/GameLogin/login", { err: `Senha errada` })
            
            let btc = _BitcoinWallet ( User.id )
            let pc = _PC ( User.id )

            let virus = User.virus.selected


            res.render("game/Game/game", { acc: User, btc: btc, pc: pc, virus: virus, sites: Sites })
        })

    // REGISTER //
        app.post ( "/register", ( req, res ) => {
            let UserInfos = { username: req.body.username, login: req.body.login, password: req.body.password }

            if ( Users.find ( _user => _user.username === UserInfos.username ) ) return res.render("game/GameRegister/register", { err: `O Nome "${UserInfos.username}" ja existe` })
            if ( Users.find ( _user => _user.login === UserInfos.login ) ) return res.render("game/GameRegister/register", { err: `O Login "${UserInfos.login}" ja existe` })
        
            let ID = _GenereteRandomString( 16 )

            Users.push({
                username: UserInfos.username,
                login: UserInfos.login,
                password: UserInfos.password,

                id: ID,

                sites: [],
                virus: [],
            })

            Pcs.push({
                id: ID,
                apps: [
                    { name: "Google", open: "google", iconName: "google-icon.png" },
                    { name: "Baidu", iconName: "baidu-icon.png" },
                    { name: "BitCoins", open: "bitcoin", iconName: "bitcoin-icon.png" },
                    { name: "Cmd", iconName: "cmd-icon.png" },
                    { name: "Kali Linux", iconName: "kali-icon.png" },
                    { name: "Spotify", iconName: "spotify-icon.png" },
                    { name: "Steam", iconName: "steam-icon.png" },
                    { name: "Tor", iconName: "tor-icon.png" },
                    { name: "Torrent", iconName: "torrent-icon.png" },
                    { name: "Lixeira", iconName: "trash-icon.png" },
                    { name: "Winrar", iconName: "winrar-icon.png" },
                ],
                wallpaper: ""
            })

            BitcoinWallets.push ({
                id: ID,
                hash: _GenereteRandomString(8),
                bitcoins: 0
            })

            return res.render("game/GameLogin/login", { err: null })

            _SaveJsons()
        })
app.listen(port, ( ) => { console.log( port ) })
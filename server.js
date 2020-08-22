const express = require('express')
const app = express()
const axios = require('axios')
const DOMParser = require('dom-parser')

var cors = require('cors')

const PORT = process.env.PORT || 5000
const CORS = 'https://cors-anywhere.herokuapp.com/'

app.use(cors())

/*
this server was based on vidstreaming.io
*/

const myTrimAndSlice = (string) => {
    trimmed = string.trim()
    sliced = trimmed.slice(0, trimmed.lastIndexOf('Episode'))
    return sliced
}

/*
Need to change getSearchDom variables to more general term.
The variable was used first while i was testing the scraping
and it was copy pasted to other routes
*/

app.get('/api/search', cors(), (req, res) => {

    axios.get(`https://vidstreaming.io/search.html?keyword=${req.query.keyword}`)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))
})

app.get('/api/anime/:name', (req, res) => {
    axios.get(`https://vidstreaming.io/videos/${req.params.name}-episode-1`)
        .then((res) => res.data)
        .then((data) => {
            let anime = {}
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            // way attribute selector yawa
            let img = getSearchDom.getElementsByTagName('meta')[5].getAttribute('content')
            anime.img = img

            let episodes = []
            Array.from(getSearchDom.getElementsByClassName('listing items lists')[0].getElementsByClassName('name')).forEach(x => episodes.push(x.innerHTML.trim()))
            anime.episodes = episodes

            //description returned with p tags
            let description = getSearchDom.getElementById('rmjs-1').innerHTML.trim()
            anime.description = description


            res.send(anime)
        })
        .catch((e) => {
            console.log(e)
            res.send(e)
        })

})

// app.get('/api/img/:name', (req, res) => {
//     axios.get(`https://vidstreaming.io/search.html?keyword=${req.params.name}`)
//         .then((res) => res.data)
//         .then((data) => {
//             getSearchDom = new DOMParser().parseFromString(data, 'text/html')
//             let img = getSearchDom.getElementsByClassName('video-block')[0].getElementsByTagName('img')[0].getAttribute('src')

//             res.send(img)
//         })
//         .catch((e) => console.log(e))
// })

// app.get('/api/episodes/:name', (req, res) => {
//     axios.get(`https://vidstreaming.io/videos/${req.params.name}-episode-1`)
//         .then((res) => res.data)
//         .then((data) => {
//             let arr = []
//             getSearchDom = new DOMParser().parseFromString(data, 'text/html')
//             Array.from(getSearchDom.getElementsByClassName('listing items lists')[0].getElementsByClassName('name')).forEach(x => arr.push(x.innerHTML.trim()))
//             res.send(arr)
//         })
//         .catch((e) => console.log(e))
// })
app.get('/api/iframe/:name_episode', (req, res) => {
    axios.get(`https://vidstreaming.io/videos/${req.params.name_episode}`)
        .then((res) => res.data)
        .then((data) => {
            let iframe_link = ''
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            iframe_link = getSearchDom.getElementsByTagName('iframe')[0].getAttribute('src').slice(2)
            res.send(iframe_link)
        })
        .catch((e) => console.log(e))
})
app.get('/api/video-src/:name_episode', (req, res) => {
    const keys = ['URASDGHUSRFSJGYfdsffsderFStewthsfSFtrftesdf', 'AawehyfcghysfdsDGDYdgdsfsdfwstdgdsgtert', 'AdrefsdsdfwerFrefdsfrersfdsrfer36343534', 'AdeqwrwedffryretgsdFrsftrsvfsfsr']
    axios.get(`https://vidstreaming.io/videos/${req.params.name_episode}`)
        .then((res1) => res1.data)
        .then((data) => {
            let iframe_link = ''
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            iframe_link = getSearchDom.getElementsByTagName('iframe')[0].getAttribute('src').slice(2)

            axios.get('http://' + iframe_link.replace('streaming.php', 'loadserver.php'))
                .then((res2) => res2.data)
                .then((data) => {
                    dom = new DOMParser().parseFromString(data, 'text/html')
                    const extractSource = string => string.slice(string.indexOf('https'), (string.indexOf('label') - 2))
                    const tempURL = extractSource(dom.getElementsByTagName('script')[3].innerHTML)
                    if (tempURL.search('https://vidstreaming.io/goto.php?') === -1)
                        res.send(tempURL)
                    else {
                        const extractBase64URL = tempURL.slice(tempURL.indexOf('url=') + 4)

                        let temp = ''
                        keys.map((x, i) => {
                            if (extractBase64URL.search(keys[i]) !== -1)
                                temp = extractBase64URL.replace(x, '')
                        })
                        let buff = Buffer.from(temp, 'base64');

                        const realSource = buff.toString()
                        res.send(realSource)
                    }

                })
                .catch((e) => console.log(e))

        })
        .catch((e) => console.log(e))
})
/*
routes below could be converted in to this
but for convention just follow those 

app.get('/api/:x', (req, res) => {
    const url = req.params.x !== 'recently-added-sub' ? `https://vidstreaming.io/${req.params.x}` : `https://vidstreaming.io`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))
})
*/

app.get('/api/recently-added-sub', (req, res) => {
    const url = req.query.page ? `https://vidstreaming.io/?page=${req.query.page}` : `https://vidstreaming.io`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))
})

app.get('/api/recently-added-raw', (req, res) => {
    const url = req.query.page ? `https://vidstreaming.io/recently-added-raw?page=${req.query.page}` : `https://vidstreaming.io/recently-added-raw`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))

})
app.get('/api/recently-added-dub', (req, res) => {
    const url = req.query.page ? `https://vidstreaming.io/recently-added-dub?page=${req.query.page}` : `https://vidstreaming.io/recently-added-dub`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))

})
app.get('/api/movies', (req, res) => {
    const url = req.query.page ? `https://vidstreaming.io/movies?page=${req.query.page}` : `https://vidstreaming.io/movies`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))

})

app.get('/api/new-season', (req, res) => {
    const url = req.query.page ? `https://vidstreaming.io/new-season?page=${req.query.page}` : `https://vidstreaming.io/new-season`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))

})

app.get('/api/popular', (req, res) => {
    const url = req.query.page ? `https://vidstreaming.io/popular?page=${req.query.page}` : `https://vidstreaming.io/popular`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))

})
app.get('/api/ongoing-series', (req, res) => {
    const url = req.query.page ? `https://vidstreaming.io/ongoing-series?page=${req.query.page}` : `https://vidstreaming.io/ongoing-series`
    axios.get(url)
        .then((res) => res.data)
        .then((data) => {
            getSearchDom = new DOMParser().parseFromString(data, 'text/html')
            let list = []
            Array.from(getSearchDom.getElementsByClassName('video-block')).forEach(element => {
                list.push({
                    img: element.getElementsByTagName('img')[0].getAttribute('src'),
                    name: myTrimAndSlice(element.getElementsByClassName('name')[0].innerHTML)
                })
            })
            res.send(list)
        })
        .catch((e) => console.log(e))

})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

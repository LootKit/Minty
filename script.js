const ssc = new SSC('https://api.steem-engine.com/rpc');
let engine_tokens = []

window.onload = () => {
    if (window.steem_keychain) {
        steem_keychain.requestHandshake(() => {
            console.log('Handshake Received!')
        })
    } else console.error('No \'window.steem_keychain\' Found')

    ssc.find('tokens', 'tokens', {}, 1000, 0, [], (err, result) => {
        if (err) {
            console.error(err)
            document.getElementById('loading-text').innerText = 'ERROR OCCURED -- CHECK CONSOLE (F12)'
        }
        else {
            document.getElementById('loading-text').style.display = 'none'
            result.forEach(token => {
                engine_tokens.push({'symbol': token.symbol, 'name': token.name})
                document.getElementById('engine-token-list').innerHTML += `<option value="${token.name} (${token.symbol})"/>`
            })
        }
    })
}

let nft_symbol, issuer, issue_to, fee_symbol = ''
let nft_properties = {}
let locked_tokens = {}

function lock_token() {
    if (Object.keys(locked_tokens).length >= 10) return

    let amount = document.getElementById('token-lock-amount').value
    if (amount == undefined || amount == '' || amount == null || amount <= 0) return
    
    let token = document.getElementById('engine-tokens').value
    token = token.substring(token.indexOf('(')+1, token.indexOf(')'))

    let exist_check = false
    if (locked_tokens[token]) exist_check = true

    locked_tokens[token] = amount.toString()

    if (Object.keys(locked_tokens).length >= 10) {
        let button = document.getElementById('lock-token-button')
        button.disabled = true
        button.innerText = 'max of 10 locked tokens'
    }

    if (!exist_check) document.getElementById('locked-token-list').innerHTML += `<li id="locked-token-${token}" onclick="remove_locked_token(this)">${amount} ${token.toLowerCase()}</li>`
    else document.getElementById(`locked-token-${token}`).innerText = `${amount} ${token.toLowerCase()}`

    document.getElementById('engine-tokens').value = ''
    document.getElementById('token-lock-amount').value = 0
}

function remove_locked_token(token) {
    delete locked_tokens[token.innerText.substring(token.innerText.indexOf(' ')+1)]
    token.parentNode.removeChild(token)
    
    if (Object.keys(locked_tokens).length < 10) {
        let button = document.getElementById('lock-token-button')
        button.disabled = false
        button.innerText = 'lock up this token'
    }
}

function issue_new_token() {
    issue_to = document.getElementById('prop-issuer').value
    issuer = document.getElementById('prop-issuee').value

    let name = document.getElementById('prop-name').value
    let prop1 = document.getElementById('prop-1').value
    let prop2 = document.getElementById('prop-2').value
    let prop3 = document.getElementById('prop-3').value
    let prop4 = document.getElementById('prop-4').value
    let prop5 = document.getElementById('prop-5').value
    let prop6 = document.getElementById('prop-6').value
    let prop7 = document.getElementById('prop-7').value
    let prop8 = document.getElementById('prop-8').value
    
    if (name != '') nft_properties.setName = name
    if (prop1 != '') nft_properties.Property1 = prop1
    if (prop2 != '') nft_properties.Property2 = prop2
    if (prop3 != '') nft_properties.Property3 = prop3
    if (prop4 != '') nft_properties.Property4 = prop4
    if (prop5 != '') nft_properties.Property5 = prop5
    if (prop6 != '') nft_properties.Property6 = prop6
    if (prop7 != '') nft_properties.Property7 = prop7
    if (prop8 != '') nft_properties.Property8 = prop8
    
    let nft_data = `{"contractName": "nft","contractAction": "issue","contractPayload": {"symbol": "SETS","to": "${issue_to}","feeSymbol": "ENG","lockTokens": ${JSON.stringify(locked_tokens)},"properties": ${JSON.stringify(nft_properties)}}}`

    steem_keychain.requestCustomJson(issuer.toLowerCase(), 'ssc-mainnet1', 'Active', nft_data, `Issue New Token: ${name}, To: ${issue_to}`, function(response) {
        console.log(response);
    });
}
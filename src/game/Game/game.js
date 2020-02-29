let contents = {
    "newVirus":
        `
            <div class="newVirus">
                <span id='title-list'>Novo Virus</span>
                <input type="text" id="virus-name" placeholder="Nome Do Virus" class="newVirusStyleInput">
                <textarea id="virus-code">Codigo Do Virus</textarea>
                <input type="button" value="Criar Virus" onclick="CreateNewVirus()" class="newVirusStyleInput">
            </div>
        `,
    "newSite":
    `
        <div class="newSite">
            <span id='title-list'>Novo Site</span>
            <input type="text" id="site-name" placeholder="Nome Do Site" class="newSiteStyleInput">
            <textarea id="site-code">Codigo Do Site</textarea>
            <input type="button" value="Criar Site" onclick="CreatenewSite()" class="newSiteStyleInput">
        </div>
    `,
    
}

function SetContent ( content ) {
    document.querySelector ( ".screen" ).innerHTML = contents [ content ]
}

function EditUser ( body ) {
    let baseUrl = "http://localhost:3000/api/edituser"
    body = JSON.stringify(body)
    console.log(body)
    fetch(baseUrl, {
        method: "post",
        body: body
    })
}

function CreateNewVirus () {
    let Body = {
        UserInfos: {
            login: "<%= acc.login %>"
        }
    }
    EditUser ( Body )
}
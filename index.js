const TOKEN = "6c1cf4474f56ad3850bd8cbc0a399ad892efc77a";

const axios = require("axios");

async function readFile(path, branch) {
    const GET_URL = `https://api.github.com/repos/DharanBro/sample/contents/${path}`;

    const REQ_HEADER = {
        'params': {
            'ref': branch
        },
        'headers': {
            'Authorization': "token " + TOKEN
        }
    };
    try {
        let response = await axios.get(GET_URL, REQ_HEADER);
        return response.data;
    } catch (error) {
        console.log("file not found");
        return false;
    }

}

async function mergeWithFork() {

    const UPSTREAM_URL = "https://api.github.com/repos/visualbis/PowerBI/git/refs/heads/master";

    const REQ_HEADER = {
        'headers': {
            'Authorization': "token " + TOKEN
        }
    };

    try {
        let response = await axios.get(UPSTREAM_URL, REQ_HEADER);
        console.log(response.data.object.sha);
        const MERGE_URL = "https://api.github.com/repos/DharanBro/PowerBI/merges";

        const REQ_BODY = {
            "base": "master",
            "head": response.data.object.sha,
            "commit_message": "merge with visualbis:master"
        }


        try {
            let response = await axios.post(MERGE_URL, REQ_BODY, REQ_HEADER);
            console.log(response.status);
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }


}

async function writeFile(path, branch) {
    // const PATH = "test.txt";
    let file = await readFile(path, branch);

    const WRITE_URL = `https://api.github.com/repos/DharanBro/sample/contents/${path}`;

    const REQ_HEADER = {
        'headers': {
            'Authorization': "token " + TOKEN
        }
    };

    let req_body = {
        "message": "API Commit",
        "content": Buffer.from("Content overwritten from the API - 1").toString('base64'),
        "branch": branch,
    }

    if (file) {
        req_body.sha = file.sha;
    }

    try {
        let response = await axios.put(WRITE_URL, req_body, REQ_HEADER);
        return response.data;
    } catch (error) {
        console.log(error);
        return false;
    }


}

writeFile("newfile.txt", "test");

// mergeWithFork();`

// readFile();

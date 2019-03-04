const Octokit = require('@octokit/rest');
const octokit = new Octokit({
    auth: 'token '
})
let owner = "dharanbro";
let repo = "sample";
let ref = "heads/master";

let newRef = "refs/heads/multiFileWrite"

async function startMultiFileWrite() {
    try {

        // Get the ref for the base branch "master"
        let baseRefResult = await octokit.git.getRef({ owner, repo, ref })
        let sha = baseRefResult.data.object.sha;

        // Create a new branch
        let newBranch = await octokit.git.createRef({ owner, repo, ref: newRef, sha });

        // Get the file contents
        let firstFilePath = "public/index.html";
        firstFileResult = await octokit.repos.getContents({ owner, repo, path: firstFilePath, ref });

        let secondFilePath = "README.md";
        secondFileResult = await octokit.repos.getContents({ owner, repo, path: secondFilePath, ref });

        // Append some data to the existing content
        let firstFileData = firstFileResult.data.content;
        let firstBuff = new Buffer(firstFileData, 'base64');
        firstFileData = firstBuff.toString('ascii');

        firstFileData += "Appending additional content for Multi file wrie test in file 1";


        let secondFileData = secondFileResult.data.content;
        let secondBuff = new Buffer(secondFileData, 'base64');
        secondFileData = secondBuff.toString('ascii');

        secondFileData += "Appending additional content for Multi file wrie test in file 2";


        let newContents = {
            [firstFilePath]: firstFileData,
            [secondFilePath]: secondFileData
        }

        let treeWithModifiedFiles = [];

        let paths = Object.keys(newContents);
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            const result = await octokit.git.createBlob({ owner, repo, content: newContents[path] });
            treeWithModifiedFiles.push({
                path,
                mode: "100644",
                type: "blob",
                sha: result.data.sha
            });
        }

        // Get the latest commit in the new branch
        const commit = await octokit.git.getCommit({ owner, repo, commit_sha: newBranch.data["object"]["sha"] });

        // Get the tree from the current commit
        let tree = commit.data["tree"]

        // Create a new tree from a base tree
        let newTree = await octokit.git.createTree({ owner, repo, tree: treeWithModifiedFiles, base_tree: tree["sha"] });

        let commitMessage = "Multiple file write";

        const createCommitResult = await octokit.git.createCommit({
            owner,
            repo,
            message: commitMessage,
            tree: newTree.data["sha"],
            parents: [commit.data["sha"]]
        });

        await octokit.git.updateRef({ owner, repo, ref: "heads/multiFileWrite", sha: createCommitResult.data["sha"] });

        let title = "Update foo and bar"
        let body = "This Pull Request appends foo with `bar`, bar with `baz`."
        await octokit.pulls.create({ owner, repo, title, head: "multiFileWrite", base: "master", body });
    } catch (e) {
        console.log(e);
    }
}


startMultiFileWrite();
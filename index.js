const rp = require('request-promise');
const cheerio = require('cheerio');
const Table = require('cli-table');
const { cachedDataVersionTag } = require('v8');

let users = [];
let table = new Table({
    head: ['username' ,'(**)', 'challenges'],
    colWidths: [15, 5, 10]

})
const options = {
    url:`https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received`,
    json: true
}
rp(options)
    .then((data) =>{
        let userData = [];
        for(let user of data.directory_items){
            userData.push({name: user.user.username, likes_received: user.likes_recieved})
        }
        process.stdout.write('Loading')
        getChallengesCompletedAndPushToUserArray(userData);
    })
    .catch((err)=>{
        console.log(err);
    });
    function getChallengesCompletedAndPushToUserArray(userData)
    {
        var i = 0;
        function next(){
            if(i<userData.length){
                var options ={
                    url: `https://www.freecodecamp.org/`+userData[i].name,
                    transform: body => cheerio.load(body)
                }
                rp(options)
                    .then(function($){
                        process.stdout.write(`.`);
                        const fccAccount = $('h1.loading-heading').length == 0;
                        const challengePassed = fccAccount ? $('tbody tr').length: 'unknown'
                        table.push([userData[i].name, userData[i].likes_received, challengePassed]);
                        ++i;
                        return next();
                    })
            }else{
                printData();
            }
        }
        return next();
    };  

    function printData()
    {
        console.log("#");
        console.log(table.toString());
    }
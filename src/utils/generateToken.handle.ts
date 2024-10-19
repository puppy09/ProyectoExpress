import * as crypto from 'crypto';
const geneToken = async()=>{
    const groupToken = crypto.randomBytes(6).toString('hex');
    console.log('Token generado', groupToken);
    return groupToken;
} 
export{geneToken};
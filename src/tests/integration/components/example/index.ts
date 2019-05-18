import { Component } from '../../../../loader/Components';
import Muchas from '../../../../';

export = new Component({
    routes: [
        {
            path: '/',
            method: 'get',
            controller: (req, res) => { res.json({a : 1})}
        },
        {
            path: '/private',
            method: 'get',
            secure: true,
            controller: (req, res) => { res.json({a : 1})}
        },
    ],
    rpc: [
        {
            queue: 'teste',
            action: (payload, done) => { done(`Oii ${payload}`) }
        }
    ]
})

setTimeout(async (): Promise<void> => {
    const response = await Muchas.broker.sendRPC('teste', 'henriquedsadsa')
}, 3000);
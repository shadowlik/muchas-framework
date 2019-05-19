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
    ],
    tasks: [
        {
            exchange: 'teste',
            queue: 'oi',
            routeKey: 'oi',
            action: (payload, done): void => {
                console.log(payload);
                done();
            }
        }
    ]
});


setTimeout(async (): Promise<void> => {
    await Muchas.broker.rpc('teste', 'henriquedsadsa');
}, 3000);
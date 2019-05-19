import Muchas, { Component } from '../../../../';

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
    routines: [
        {
            id: 'teste2',
            cron: '*/1 * * * *',
            action: (done): void =>
            {
                Muchas.log.error('teste');
                done();
            }
        }
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
                Muchas.log.error('teste');
                done();
            }
        }
    ]
});

setTimeout(async (): Promise<void> => {
    await Muchas.broker.rpc('teste', 'henriquedsadsa');
    Muchas.log.error('teste');
}, 3000);

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
            queue: 'rpc_teste',
            action: (payload, done) => { done(`Oii ${payload}`) }
        }
    ],
    tasks: [
        {
            exchange: 'teste',
            queue: 'users',
            routeKey: 'new',
            action: (payload, done): void => {
                Muchas.log.error('teste');
                done();
            }
        }
    ]
});

setTimeout(async (): Promise<void> => {
    const res = await Muchas.broker.rpc('rpc_teste', 'henriquedsadsa');
    Muchas.log.error(res);
}, 3000);

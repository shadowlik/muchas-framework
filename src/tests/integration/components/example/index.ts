import Muchas, { Component, ServerError } from '../../../../';
import axios from 'axios';

export = new Component({
    routes: [
        {
            path: '/',
            method: 'get',
            controller: (req, res): void => {
                res.json({a : 1});
            }
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
            id: '1',
            cron: '*/1 * * * *',
            concurrency: 2,
            action: (job, done): void =>
            {
                // job.fail('teste');
                done();
            }
        },
        {
            id: 'google',
            cron: '* * * * *',
            concurrency: 2,
            action: async (job, done): Promise<any> =>
            {
                setTimeout(async (): Promise<any> => {
                    const res = await axios.get('https://google.com.br');
                    console.log(res.status);
                    // job.fail('teste');
                    done();
                }, 10000);
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
                Muchas.log.error('teste', '1111');
                done();
            }
        }
    ]
});

setTimeout(async (): Promise<void> => {
    const res = await Muchas.broker.rpc('rpc_teste', 'henriquedsadsa');
    Muchas.log.error(res, '1111');
}, 3000);

import { Component } from '../../../../';

export = new Component({
    routes: [
        {
            path: '/',
            method: 'get',
            controller: (req, res): void => {
                res.json('root');
            }
        }
    ]
});
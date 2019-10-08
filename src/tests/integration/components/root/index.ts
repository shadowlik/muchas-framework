import { Component, ServerError } from '../../../../';

export = new Component({
    routes: [
        {
            path: '/',
            method: 'get',
            controller: (req, res, next): void => {
                // res.json('root');
                throw new ServerError('Error', '1000', 400);
            }
        }
    ]
});
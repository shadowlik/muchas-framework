import { Component } from '../../../../loader/Components';
import Muchas from '../../../../';

export = new Component({
    routes: [
        {
            path: '/teste',
            method: 'get',
            controller: (req, res) => { res.json({a : 1})}
        }
    ]
})
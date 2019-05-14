import { Component } from '../../../../../../src/loader/Components';

export = new Component({
    routes: [
        {
            path: '/teste',
            method: 'get',
            controller: (req, res) => { res.json({a : 1})}
        }
    ]
})
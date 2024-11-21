export function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


export function isAdminAuth(req, res, next) {
    if (req.session.user) {
        if (req.session.user.role !== 'ADMIN') {
            res.status(403).send({message: 'У вас нет доступа к этой странице.'})
        } else {
            next()
        }
    } else {
        res.redirect('/login');
    }
}

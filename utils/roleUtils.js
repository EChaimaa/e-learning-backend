const hasRole = (user, role) => {
    if (!user.roles) {
        return false;
    }
    return user.roles.indexOf(role) >= 0;
}

const hasAnyRole = (user, roles) => {
    if (!user.roles) {
        return false;
    }
    return roles.some(role => user.roles.indexOf(role) >= 0);
}

const hasAllRoles = (user, roles) => {
    if (!user.roles) {
        return false;
    }
    return roles.every(role => user.roles.indexOf(role) >= 0);
}

module.exports = {
    hasRole,
    hasAnyRole,
    hasAllRoles
}
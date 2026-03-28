exports.sanitizeUser=(user)=>{
    const role = user.role || (user.isAdmin ? 'admin' : 'buyer')
    const isAdmin = user.isAdmin || role === 'admin'
    return {
        _id:user._id,
        email:user.email,
        name:user.name,
        isVerified:user.isVerified,
        role,
        isAdmin,
        referralCode:user.referralCode,
        twoFactorEnabled:user.twoFactorEnabled,
    }
}
import bcrypt from 'bcrypt'


export async function hashPassword (password) {
    try {
      return await bcrypt.hash(password, 10)
    } catch (error) {
      console.log(error)
    }

    return null
}

export async function comparePassword (password, hash) {
    try {
      return await bcrypt.compare(password, hash)
    } catch (error) {
      console.log(error)
    }

    return false
}

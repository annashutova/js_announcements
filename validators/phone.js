export default function validatePhone(phone) {
    const isDigit = !isNaN(phone.slice(1))
    const hasValidLength = phone.length === 12
    const startsWithRusCode = phone.startsWith("+7")
    return isDigit && hasValidLength && startsWithRusCode
}
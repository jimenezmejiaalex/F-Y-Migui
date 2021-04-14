export class User {
    firstName = '';
    lastName = ''
    isAdmin = false;
    email = ''
    phone = ''
    constructor(firstName, lastName, isAdmin, email, phone) {
        this.firstName = firstName
        this.lastName = lastName
        this.isAdmin = isAdmin
        this.email = email
        this.phone = phone
    }
}
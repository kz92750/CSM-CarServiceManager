export type Customer = {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
}

export type Car = {
    id: string
    customerId: string
    make: string
    model: string
    vin: string
    mileage: number
    licensePlate: string
}

export type ServiceVisit = {
    id: string
    carId: string
    visitDate: string
    description: string
    status: number
    requestedCost: number
}
export type ProductInventory = {
    id: string,
    storeId: string,
    quantity: number,
    minStock: number,
    isLowStock: boolean
}
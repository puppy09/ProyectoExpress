import { category } from "../models/category.model";
import { Op } from "sequelize";

const validateTotalBudgetPercentage = async (newCategoryPercentage: number, userId: number, categoryId?: number): Promise<boolean> => {
    // Fetch all active categories for the given user
    const activeCategories = await category.findAll({
        where: {
            id_user: userId,
            estatus: 1,
            // Optionally filter out the category being updated (if updating)
            ...(categoryId ? { ID: { [Op.ne]: categoryId } } : {}) 
        },
        attributes: ['presupuesto'] // Fetch only the percentage field
    });

    // Calculate the total percentage of existing categories
    const totalPercentage = activeCategories.reduce((sum, category) => sum + category.presupuesto, 0);

    // Check if the total percentage + new category exceeds 100%
    return (totalPercentage + newCategoryPercentage) <= 100;
};
export {validateTotalBudgetPercentage};

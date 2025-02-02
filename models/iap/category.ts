import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAvailableCategoriesForTeam = async (teamId: string) => {
  try {
    // Fetch categories that are either default or belong to the specified team
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          {
            isDefault: true,
          },
          {
            teamId: teamId,
          },
        ],
      },
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Could not fetch categories');
  }
};

export const createCategory = async ({
  name,
  teamId,
}: {
  name: string;
  teamId: string;
}) => {
  try {
    const category = await prisma.category.create({
      data: {
        name: name,
        isDefault: false,
        teamId: teamId,
      },
    });
    return category;
  } catch (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }
};

import { API_URL } from "../config";

export const getCategories = async () => {
  const userId = localStorage.getItem('userId');
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        userId
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  const userId = localStorage.getItem('userId');
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        userId
      },
      body: JSON.stringify({
        ...categoryData,
        userId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  const userId = localStorage.getItem('userId');
  try {
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        userId
      },
      body: JSON.stringify(categoryData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  const userId = localStorage.getItem('userId');
  try {
    const response = await fetch(`${API_URL}/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        userId
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};


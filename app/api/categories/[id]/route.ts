// app/api/categories/[id]/route.ts
/*eslint-disable @typescript-eslint/no-require-imports*/
/*eslint-disable  @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth-utils'

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const category = await prisma.category.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found or unauthorized' },
        { status: 404 }
      )
    }

    // Validate data if provided
    if (data.type && !['income', 'expense'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Type must be either "income" or "expense"' },
        { status: 400 }
      )
    }

    // Check if new name conflicts with existing category
    if (data.name && data.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: data.name.trim(),
          userId: userId,
          type: data.type || existingCategory.type,
          NOT: {
            id: id
          }
        }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists for this type' },
          { status: 409 }
        )
      }
    }

    const updateData = {
      name: data.name ? data.name.trim() : undefined,
      type: data.type,
      icon: data.icon
    }

    // Remove undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )

    const category = await prisma.category.update({
      where: { id: id },
      data: filteredData
    })
    
    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error updating category:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update category',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    const userId = await getUserIdFromRequest(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        userId: userId
      }
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found or unauthorized' },
        { status: 404 }
      )
    }

    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id }
    })
    
    if (transactionCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with existing transactions',
          transactionCount: transactionCount
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: id }
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete category',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
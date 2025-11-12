// src/app/api/teams/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import Team from '@/models/Team'

// GET all teams
export async function GET() {
  try {
    await connectDB()
    const teams = await Team.find().sort({ createdAt: -1 })
    
    return NextResponse.json({
      success: true,
      teams,
    })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Add new team
export async function POST(request) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, lead, members, description } = body

    if (!name || !lead) {
      return NextResponse.json(
        { success: false, error: 'Name and Team Lead are required' },
        { status: 400 }
      )
    }

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name })
    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Team name already exists' },
        { status: 400 }
      )
    }

    // Create team
    const team = await Team.create({
      name,
      lead,
      members: members || [],
      description: description || '',
    })

    return NextResponse.json({
      success: true,
      team,
      message: 'Team added successfully',
    })
  } catch (error) {
    console.error('Error adding team:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // const readme = await generateReadme(repoUrl);
    // return NextResponse.json({ readme });
  } catch (error) {
    console.error('Error generating README:', error);
    return NextResponse.json(
      { error: 'Failed to generate README' },
      { status: 500 }
    );
  }
} 
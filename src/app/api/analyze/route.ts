import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit();

interface RepoInfo {
  owner: string;
  repo: string;
}

function parseGitHubUrl(url: string): RepoInfo {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  return {
    owner: match[1],
    repo: match[2],
  };
}

async function getRepositoryData(owner: string, repo: string) {
  try {
    const [repoData, contents] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.getContent({ owner, repo, path: '' })
    ]);

    let dependencies = {};
    try {
      const { data: packageJson } = await octokit.repos.getContent({
        owner,
        repo,
        path: 'package.json',
      });
      
      if ('content' in packageJson) {
        const content = Buffer.from(packageJson.content, 'base64').toString();
        const pkg = JSON.parse(content);
        dependencies = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };
      }
    } catch (error) {
      // package.json not found, that's okay
    }

    return {
      repoData: repoData.data,
      contents: Array.isArray(contents.data) ? contents.data : [],
      dependencies
    };
  } catch (error) {
    console.error('Error fetching repository data:', error);
    throw new Error('Failed to fetch repository data');
  }
}

function generateReadmeContent(repoData: any, contents: any[], dependencies: any): string {
  const sections: string[] = [];

  // Title and Description
  sections.push(`# ${repoData.name}\n`);
  sections.push(repoData.description || 'No description provided.\n');

  // Technologies Used
  const technologies = Object.keys(dependencies);
  if (technologies.length > 0) {
    sections.push('## Technologies Used\n');
    sections.push('This project uses the following technologies:\n');
    sections.push(technologies.map(tech => `- ${tech}`).join('\n'));
  }

  // Project Structure
  sections.push('\n## Project Structure\n');
  sections.push('```\n');
  sections.push(contents
    .filter(item => item.type === 'file' || item.type === 'dir')
    .map(item => item.path)
    .join('\n'));
  sections.push('\n```\n');

  // Setup Instructions
  sections.push('## Setup Instructions\n');
  sections.push('1. Clone the repository:\n');
  sections.push('```bash\n');
  sections.push(`git clone ${repoData.clone_url}\n`);
  sections.push('```\n');

  if (Object.keys(dependencies).length > 0) {
    sections.push('2. Install dependencies:\n');
    sections.push('```bash\n');
    sections.push('npm install\n');
    sections.push('```\n');
  }

  // Environment Variables
  const envFiles = contents.filter(item => 
    item.type === 'file' && item.path.match(/^\.env/)
  );
  
  if (envFiles.length > 0) {
    sections.push('\n## Environment Variables\n');
    sections.push('The following environment files are present in the project:\n');
    sections.push(envFiles.map(file => `- ${file.path}`).join('\n'));
  }

  // License
  if (repoData.license) {
    sections.push('\n## License\n');
    sections.push(`This project is licensed under the ${repoData.license.name} - see the LICENSE file for details.`);
  }

  return sections.join('\n');
}

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    const { owner, repo } = parseGitHubUrl(repoUrl);
    const { repoData, contents, dependencies } = await getRepositoryData(owner, repo);
    const readme = generateReadmeContent(repoData, contents, dependencies);

    return NextResponse.json({ readme });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze repository' },
      { status: 500 }
    );
  }
} 
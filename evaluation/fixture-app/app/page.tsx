const pages = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];

export default function Index() {
  return <main><h1>Fixture app</h1><ul>{pages.map(page => <li key={page}><a href={`/${page}`}>{page.toUpperCase()}</a></li>)}</ul></main>;
}

import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Wir schenken Technologie neues Leben und bringen Bildung zu allen.</h1>
      <p className="lead">
        Gebrauchte Laptops und Tablets werden geprüft, sicher gelöscht und an Schüler:innen weitergegeben.
        Prüfen Sie in wenigen Schritten, ob Ihr Gerät passt.
      </p>
      <p><Link className="btn" href="/spenden">Laptop oder Tablet spenden</Link></p>
    </>
  );
}

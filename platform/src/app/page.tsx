import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Technik weitergeben. Chancen eröffnen.</h1>
      <p className="lead">
        Gebrauchte Laptops und Tablets werden geprüft, sicher gelöscht und an Schüler:innen weitergegeben.
        Prüfen Sie in wenigen Schritten, ob Ihr Gerät passt.
      </p>
      <p><Link className="btn" href="/spenden">Laptop oder Tablet spenden</Link></p>
    </>
  );
}

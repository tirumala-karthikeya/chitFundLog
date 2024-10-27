import Image from "next/image";
import Link from "next/link"; 
import 'bootstrap/dist/css/bootstrap.min.css';


export default function Home() {
  return (
    <div>
      {/* header */}
      <section>
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
        <div className="col-md-3 mb-2 mb-md-0">
          <Link href="/" className="d-inline-flex link-body-emphasis text-decoration-none">
            <svg className="bi" width="40" height="32" role="img" aria-label="Bootstrap">
              <use xlinkHref="#bootstrap"></use>
            </svg>
          </Link>
        </div>

        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
          <li><Link href="#" className="nav-link px-2 link-secondary">Home</Link></li>
          <li><Link href="#" className="nav-link px-2">Features</Link></li>
          <li><Link href="#" className="nav-link px-2">Pricing</Link></li>
          <li><Link href="#" className="nav-link px-2">FAQs</Link></li>
          <li><Link href="#" className="nav-link px-2">About</Link></li>
        </ul>

        <div className="col-md-3 text-end">
          <Link href="/auth/login">
            <button type="button" className="btn btn-outline-primary me-2">Login</button>
          </Link>
          <Link href="/auth/signup">
            <button type="button" className="btn btn-primary">Sign-up</button>
          </Link>
        </div>
         {/* Dropdown Menu */}
      <div className="dropdown text-end p-3" >
        <a href="#" className="d-block link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" className="rounded-circle" />
        </a>
        <ul className="dropdown-menu text-small">
          <li><a className="dropdown-item" href="#">New project...</a></li>
          <li><a className="dropdown-item" href="#">Settings</a></li>
          <li><a className="dropdown-item" href="#">Profile</a></li>
          <li><hr className="dropdown-divider" /></li>
          <li><a className="dropdown-item" href="#">Sign out</a></li>
        </ul>
      </div>
      </header>
      </section>
      

      <h1>Hello</h1>
      <Link href="/createChit">
        <button>Create Chit</button>
      </Link>
      <Link href="/viewChit">
        <button>View Chits</button>
      </Link>
    </div>
  );
}

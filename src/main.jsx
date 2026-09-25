import React from "react";
import { createRoot } from "react-dom/client";
import {
  HashRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./styles.css";
import { captureContact } from "./contact.js";

// Descriptions reflect the public source code and deployed project pages.
const projects = [
  {
    title: "EduGate Global",
    type: "Education consultancy website",
    detail:
      "An English and Arabic website presenting study-abroad services, destination information, and contact options.",
    outcome:
      "Published a bilingual site with responsive navigation and a WhatsApp contact workflow.",
    role: "Website developer: implemented the bilingual website and responsive interface.",
    image: "edugate.png",
    repository: "edugate-website",
    color: "violet",
  },
  {
    title: "JSEK Electronics Marketplace",
    type: "First-semester team project",
    detail:
      "A front-end electronics marketplace prototype with buyer, seller, vendor, and administrator interfaces.",
    outcome:
      "Contributed role-based entry, seller posting, multi-photo product views, and digital receipt features in a team project.",
    role: "Front-end contributor; features documented in my GitHub commit history.",
    image: "jsek.png",
    repository: "electronics-Market-place",
    color: "blue",
  },
  {
    title: "Taj Insurance Website",
    type: "Bilingual professional website",
    detail:
      "An English and Arabic website for an Ontario insurance broker, with service categories, insurer information, FAQs, and a quote-request form.",
    outcome:
      "Published a responsive website with bilingual content and contact options.",
    role: "Website developer: implemented the bilingual website and responsive interface.",
    image: "taj.png",
    repository: "Tajwebsitetest",
    color: "coral",
  },
];

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Go to home">
      <span>EAN</span>
      <b>Emad Al Nounou</b>
    </Link>
  );
}
function Layout({ children }) {
  return (
    <>
      <header>
        <Logo />
        <nav aria-label="Main navigation">
          {[
            "Home",
            "About",
            "Projects",
            "Education",
            "Services",
            "Contact",
          ].map((item) => (
            <NavLink
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            >
              {item}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <Logo />
        <p>Designed and built with React · © 2026 Emad Al Nounou</p>
      </footer>
    </>
  );
}
function ContactReceipt({ contact }) {
  if (!contact) return null;
  return (
    <aside className="contact-receipt" role="status">
      <h2>Thanks, {contact.firstName}!</h2>
      <p>
        Your message was captured for this demonstration. No email was sent.
      </p>
      <details>
        <summary>Review captured information</summary>
        <dl>
          {Object.entries(contact).map(([field, value]) => (
            <React.Fragment key={field}>
              <dt>
                {
                  {
                    firstName: "First name",
                    lastName: "Last name",
                    email: "Email",
                    phone: "Contact number",
                    message: "Message",
                  }[field]
                }
              </dt>
              <dd>{value || "Not provided"}</dd>
            </React.Fragment>
          ))}
        </dl>
      </details>
    </aside>
  );
}
function Home() {
  const { state } = useLocation();
  const contact = state?.contact;
  return (
    <>
      <ContactReceipt contact={contact} />
      <section className="hero">
        <p className="eyebrow">Hello, I’m Emad Al Nounou</p>
        <h1>
          I build calm, useful <em>digital experiences.</em>
        </h1>
        <p className="lead">
          An aspiring web developer focused on thoughtful interfaces, clean
          code, and products people enjoy using.
        </p>
        <div className="actions">
          <Link className="button" to="/projects">
            View my work
          </Link>
          <Link className="text-link" to="/about">
            More about me →
          </Link>
        </div>
        <div className="hero-card">
          <span className="spark">✦</span>
          <p>Currently learning</p>
          <strong>React, modern JavaScript & web accessibility</strong>
        </div>
      </section>
    </>
  );
}
function About() {
  return (
    <section className="split">
      <div>
        <p className="eyebrow">About me</p>
        <h1>A curious developer with an eye for detail.</h1>
        <p>
          I am <strong>Emad Al Nounou</strong>, a Software Engineering
          Technology – Artificial Intelligence (Co-op) student at Centennial
          College. I enjoy translating ideas into clear, responsive, and
          approachable web experiences.
        </p>
        <p>
          I bring over 20 years of experience in business operations, client
          relations, and project coordination to my work in software
          development. My goal is to build useful, accessible applications that
          solve practical problems.
        </p>
        <p>
          My work includes education and insurance websites alongside a
          collaborative electronics marketplace. I am developing my skills in
          React, JavaScript, and responsive interface design.
        </p>
        <a
          className="button secondary"
          href={`${import.meta.env.BASE_URL}resume.pdf`}
          download
        >
          Download my résumé (PDF)
        </a>
      </div>
      <img
        className="portrait"
        src={`${import.meta.env.BASE_URL}profile.png`}
        alt="Emad Al Nounou wearing a suit and tie"
        width="1152"
        height="1536"
      />
    </section>
  );
}
function Projects() {
  return (
    <section>
      <p className="eyebrow">Selected work</p>
      <h1>Projects I’m proud to share.</h1>
      <div className="project-grid">
        {projects.map((project) => (
          <article className={`project ${project.color}`} key={project.title}>
            <img
              className="project-image"
              src={`${import.meta.env.BASE_URL}projects/${project.image}`}
              alt={`${project.title} live website screenshot`}
              loading="lazy"
            />
            <p className="project-type">{project.type}</p>
            <h2>{project.title}</h2>
            <p>{project.detail}</p>
            <p>
              <strong>My role:</strong> {project.role}
            </p>
            <p>
              <strong>Outcome:</strong> {project.outcome}
            </p>
            <div className="project-links">
              <a
                href={`https://github.com/Emad979797/${project.repository}`}
                target="_blank"
                rel="noreferrer"
              >
                Source code ↗
              </a>
              <a
                href={`https://emad979797.github.io/${project.repository}/`}
                target="_blank"
                rel="noreferrer"
              >
                Live website ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function Education() {
  return (
    <section>
      <p className="eyebrow">Learning journey</p>
      <h1>Education & qualifications.</h1>
      <div className="timeline">
        <article>
          <p>January 2026 — Expected 2029 · Three-year program</p>
          <h2>
            Software Engineering Technology – Artificial Intelligence (Co-op)
          </h2>
          <h3>Centennial College</h3>
          <p>Advanced Diploma · In progress</p>
          <p>
            Studies include Python, C#, JavaScript, web development, SQL and
            database concepts, Linux/Unix, and software engineering
            fundamentals.
          </p>
        </article>
        <article>
          <p>2025</p>
          <h2>General Arts and Science</h2>
          <h3>Sheridan College, Ontario</h3>
          <p>Completed credential.</p>
        </article>
        <article>
          <p>2013</p>
          <h2>Professional Insurance Certificate (PIC)</h2>
          <h3>Chartered Insurance Institute (CII), United Kingdom</h3>
        </article>
        <article>
          <p>April 2004</p>
          <h2>Bachelor Degree in Business Administration</h2>
          <h3>University of Sana'a</h3>
        </article>
      </div>
    </section>
  );
}
function Services() {
  const services = [
    [
      "01",
      "Web development",
      "Responsive websites and React interfaces built with maintainable, readable code.",
    ],
    [
      "02",
      "UI implementation",
      "Turning interface concepts into accessible, polished front-end experiences.",
    ],
    [
      "03",
      "Site refreshes",
      "Helping existing websites become cleaner, faster, and easier to use.",
    ],
  ];
  return (
    <section>
      <p className="eyebrow">What I offer</p>
      <h1>Practical services for the web.</h1>
      <div className="services">
        {services.map(([num, title, text]) => (
          <article key={num}>
            <span>{num}</span>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
function Contact() {
  const navigate = useNavigate();
  function submit(e) {
    e.preventDefault();
    const contact = captureContact(new FormData(e.currentTarget));
    // Router state carries the captured values to Home without sending an email.
    navigate("/", { state: { contact } });
  }
  return (
    <section className="contact">
      <div>
        <p className="eyebrow">Get in touch</p>
        <h1>Let’s make something meaningful.</h1>
        <p>
          Email: <a href="mailto:emad9797@gmail.com">emad9797@gmail.com</a>
          <br />
          Phone: <a href="tel:+19052088444">+1 (905) 208-8444</a>
          <br />
          Mississauga, Ontario
        </p>
        <p>
          <a
            href="https://github.com/Emad979797"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>{" "}
          ·{" "}
          <a
            href="https://www.linkedin.com/in/emadalnounou"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </p>
      </div>
      <form onSubmit={submit}>
        <p className="form-note">
          Demo form: captures your details and returns you to Home. No email is
          sent.
        </p>
        <>
          <label>
            First name
            <input required name="firstName" autoComplete="given-name" />
          </label>
          <label>
            Last name
            <input required name="lastName" autoComplete="family-name" />
          </label>
          <label>
            Email address
            <input required name="email" type="email" autoComplete="email" />
          </label>
          <label>
            Contact number
            <input required name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            Message
            <textarea required name="message" rows="4" />
          </label>
          <button className="button" type="submit">
            Send message
          </button>
        </>
      </form>
    </section>
  );
}
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/education" element={<Education />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Layout>
  );
}
createRoot(document.getElementById("root")).render(
  <HashRouter>
    <App />
  </HashRouter>,
);

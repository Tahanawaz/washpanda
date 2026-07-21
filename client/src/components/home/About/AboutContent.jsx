import FeatureList from "./FeatureList";

export default function AboutContent() {
  return (
    <div>

      <p className="leading-8 text-gray-600">
       WashPanda Hand Wash is an eco-friendly, hand car wash and detailing service
based in Portland. Our company was founded back in 2005 by a team of experts
with more than 10 years of professional car wash experience. We operate three
car washes throughout the Portland area. Our goal is to provide our customers
with the friendliest, most convenient hand car wash experience possible. We use
the most modern and up-to-date water reclamation modules as a part of our car
wash systems. Our products are all biodegradable and eco-friendly.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">

        <div>
          <h3 className="mb-4 text-2xl font-bold">
            The Best Car Wash
          </h3>

          <FeatureList />
        </div>

        <div>
          <h3 className="mb-4 text-2xl font-bold">
            Contacting Us
          </h3>

          <FeatureList />
        </div>

      </div>

    </div>
  );
}
import CamelotWheel from "../../media/camelot-wheel.jpg";

const InfoCamelot = () => {
  return (
    <div className="camelot-info">
      <hr />
      <h3>Camelot Key/Wheel</h3>
      <p>
        This site uses the <i>Camelot</i> key system, which is an alternative tool to the circle of
        fifths for understanding how keys work together harmonically. It lets you understand how
        different keys might work together, without having to understand music theory.
      </p>

      <img src={CamelotWheel} alt="Camelot wheel" />
      <p>
        The basic idea is the closer the numbers are numerically, the more notes they share, and the
        better they will sound together (each number apart represents one difference). Those numbers
        that are followed by &apos;B&apos;, represent major scales, whereas those followed by
        &apos;A&apos; represent minor scales.
      </p>

      <h4 className="info-header">
        <i>So what does this all mean in practice?</i>
      </h4>
      <ul className="info-points">
        <li>
          – Those that share the same number but different letter can be mixed together easily,
          (they share the same notes but have a different
          <span>root</span> note // major to minor scale).
        </li>
        <li>– Those that are one number away from one another will be easy to mix together,</li>
        <li>{">"} (eg. 12a will be easy to mix with 1a and 11a).</li>
        <li>
          – The further two numbers are away from another the harder they will be to mix
          &apos;naturally&apos;,
        </li>
        <li>{">"} eg. where 1a is hardest to mix with 7a/7b and 3b with 9b/9a, etc.</li>
        <li>
          – Those tracks with similar BPM/Tempo are going to sound more natural when mixed close to
          one another.
        </li>
      </ul>

      <br />
      <p className="links-header">Some links for more info: </p>
      <p className="links">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://mixedinkey.com/harmonic-mixing-guide/"
        >
          https://mixedinkey.com/harmonic-mixing-guide/
        </a>
      </p>
      <p className="links">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://www.harmonic-mixing.com/howto.aspx"
        >
          http://www.harmonic-mixing.com/howto.aspx
        </a>
      </p>
    </div>
  );
};

export default InfoCamelot;

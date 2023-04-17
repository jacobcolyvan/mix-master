import InfoAfterword from '../atoms/info/InfoAfterword';
import InfoCamelot from '../atoms/info/InfoCamelot';
import InfoExtra from '../atoms/info/InfoExtra';
import InfoGeneral from '../atoms/info/InfoOverview';

const About = () => {
  return (
    <div className="about-page__div">
      <InfoGeneral />
      <InfoExtra />
      <InfoCamelot />
      <InfoAfterword />
    </div>
  );
};

export default About;

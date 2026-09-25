"""Offline-Tests für scripts/import_partnersuche.py (ohne Netzwerk).

Aufruf: npm run test:import  bzw.  python -m unittest discover -s tests -p "test_*.py"
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

import import_partnersuche as importer  # noqa: E402


class NormalizeHtmlTest(unittest.TestCase):
    def test_matches_committed_format(self):
        source = (
            '<p><img class="img-responsive" src="https://static-cms.icony-hosting.de/cms/X/1000/berlin.jpg" '
            'alt="Singles aus Berlin" loading="lazy" data-media-id="2145"></p>\n'
            "<p>&nbsp;</p>\n<p>F&uuml;r &quot;Hunde&quot; &amp; Katzen</p>\n<hr>"
        )
        self.assertEqual(
            importer.normalize_html(source),
            '<p><img alt="Singles aus Berlin" class="img-responsive" loading="lazy" '
            'src="https://static-cms.icony-hosting.de/cms/X/1000/berlin.jpg"/></p>\n'
            '<p> </p>\n<p>Für "Hunde" &amp; Katzen</p>\n<hr/>',
        )

    def test_keeps_other_data_attributes(self):
        self.assertEqual(
            importer.normalize_html('<h2 data-start="85" data-end="151">X</h2>'),
            '<h2 data-end="151" data-start="85">X</h2>',
        )

    def test_block_counts_nested_divs(self):
        page = '<div class="text-content m-t-64"><div>a</div><p>b</p></div><div>c</div>'
        self.assertEqual(importer.block(page, '<div class="text-content'), "<div>a</div><p>b</p>")

    def test_first_image_strips_alt(self):
        self.assertEqual(
            importer.first_image('<p><img alt="aarau " src="https://x/aarau.jpg"/></p>'),
            ("https://x/aarau.jpg", "aarau"),
        )


if __name__ == "__main__":
    unittest.main()
